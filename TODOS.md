# TODOS

## TODO-001: Re-scoring 기능

**What:** `POST /api/rescore` 엔드포인트 또는 CLI 스크립트 — DB에 저장된 score=-1/0 기사를 최신 `scorer_criteria.md`로 재스코어링

**Why:** `scorer_criteria.md`가 바뀌면 기존에 틀렸던 판단을 수정할 수 있어야 함. 지금은 기준이 바뀌면 DB를 리셋해야 함.

**Pros:**
- 기준 변경 비용이 거의 없어짐 (DB 리셋 없이 개선 가능)
- 좋은 기사가 잘못 걸러진 것을 소급 복구 가능

**Cons:**
- LLM API 비용 발생 (저장된 전체 기사 수 × 토큰)
- 구현 복잡도 증가

**Context:** score=-1/0 기사는 is_shown=False지만 DB에 남아있음 (설계 의도: re-scoring을 위해). 이 TODO는 그 설계 의도를 실제로 구현하는 것.

**Depends on:** Step 6 (LLM 스코어러) 완성 후 추가 가능.

---

## TODO-002: URL 정규화 (중복 방지 개선)

**What:** dedup 시 URL을 정규화해서 비교 — `http://`와 `https://`, trailing slash, 쿼리 파라미터 등을 통일한 후 중복 여부 판단

**Why:** 현재 URL을 raw 문자열로 비교하면 `http://example.com/article` 과 `https://example.com/article` 이 다른 기사로 저장됨.

**Pros:**
- 중복 기사 완전 제거
- DB 품질 향상

**Cons:**
- 일부 파라미터(utm_source 등)는 정규화 시 실제로 다른 페이지를 같은 것으로 볼 수 있음

**Context:** `engines/crawler/dedup.py` 구현 시 `urllib.parse.urlparse`로 scheme 통일 + query string 정렬 적용. Step 4(GDELT 크롤러) 이후 별도 PR로 추가.

**Depends on:** Step 4 (GDELT 크롤러) 완성 후 추가 가능.
