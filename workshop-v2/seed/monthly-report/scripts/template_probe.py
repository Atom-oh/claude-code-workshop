#!/usr/bin/env python3
"""양식 호환성 점검. 양식을 openpyxl로 열고 저장했을 때 사라지는 것이 있는지 실제로 확인한다.
사용: python3 scripts/template_probe.py template/월간점검보고서_양식.xlsx
종료 코드: 0 안전 / 1 주의 요소 있음 / 2 사용 오류
점검 1) 왕복 검사: 열었다가 저장한 파일과 원본의 내부 부품 목록을 비교해 사라진 부분을 찾는다.
점검 2) 구조 요약과 주의 요소: 수식, 시트 보호, 매크로, 외부 링크 등.
"""
import os, sys, tempfile, zipfile
from openpyxl import load_workbook

IGNORE = ("docProps/", "xl/calcChain.xml")   # 저장 때마다 다시 만들어지는 부품


def parts(path):
    with zipfile.ZipFile(path) as z:
        return {n for n in z.namelist() if not n.startswith(IGNORE)}


def main(path):
    try:
        before = parts(path)
        wb = load_workbook(path, keep_vba=path.lower().endswith(".xlsm"))
    except Exception as e:
        print(f"열 수 없음: {e}", file=sys.stderr); return 2
    warn = []
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "roundtrip.xlsx"); wb.save(out)
        lost = sorted(before - parts(out))
    if lost:
        warn.append("왕복 검사에서 사라진 부분: " + ", ".join(lost) + " → 이 양식은 openpyxl로 편집하면 손실이 생김")
    for ws in wb.worksheets:
        formulas = sum(1 for row in ws.iter_rows() for c in row if isinstance(c.value, str) and c.value.startswith("="))
        print(f"시트 '{ws.title}': 범위 {ws.dimensions}, 병합 {len(ws.merged_cells.ranges)}개, 수식 {formulas}개, "
              f"데이터 검증 {len(ws.data_validations.dataValidation)}개, 조건부 서식 {len(ws.conditional_formatting)}개, "
              f"보호 {'켜짐' if ws.protection.sheet else '꺼짐'}")
        if formulas:
            warn.append(f"시트 '{ws.title}': 수식 {formulas}개 (저장 직후에는 계산된 값이 없어 값 대조가 불가능, 수식 자체는 보존됨)")
        if ws.protection.sheet:
            warn.append(f"시트 '{ws.title}': 시트 보호가 켜져 있음")
    names = before
    if any(n.startswith("xl/charts/") for n in names):
        print("정보: 차트가 있음 (왕복 검사에서 보존됐더라도 저장 후 모양을 눈으로 확인)")
    if any(n.startswith("xl/media/") for n in names):
        print("정보: 이미지가 있음 (저장 후 위치와 크기를 눈으로 확인)")
    if any(n.startswith("xl/externalLinks/") for n in names):
        warn.append("외부 링크가 있음: 값이 오래되었을 수 있음")
    if "xl/vbaProject.bin" in names:
        warn.append("매크로(VBA)가 있음: .xlsm으로 열어 keep_vba=True로 저장해야 보존됨")
    if warn:
        print("주의:"); [print(" -", w) for w in warn]; return 1
    print("점검 통과: 왕복 검사에서 사라지는 부분 없음"); return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]) if len(sys.argv) == 2 else (print(__doc__, file=sys.stderr) or 2))
