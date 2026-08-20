# Runners League Sync (iOS)

Runners League 웹앱의 HealthKit 컴패니언 앱. Apple Watch로 기록된 러닝만 골라서
서버로 동기화합니다 — Health 앱에 사람이 손으로 입력한 기록은 자동으로 제외됩니다.

## 요구 사항

- 이 프로젝트는 [XcodeGen](https://github.com/yonaskolb/XcodeGen)으로 생성됩니다 (`brew install xcodegen`)
- 전체 Xcode 설치 필요 (Command Line Tools만으로는 빌드 불가)
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

## 열기

```bash
cd ios/RunnersLeagueSync
xcodegen generate   # project.yml이 바뀌었을 때만 다시 실행
open RunnersLeagueSync.xcodeproj
```

Xcode에서 시뮬레이터(예: iPhone 16)를 선택하고 Run(⌘R).

## 사용 흐름

1. 웹앱 `/settings/connections`에서 **Apple Watch (HealthKit)** 카드의 "토큰 발급" 클릭 → 토큰 복사
   (토큰은 발급 직후 한 번만 표시됩니다)
2. 앱 실행 → **서버 주소**에 웹앱 URL 입력 (시뮬레이터에서 Mac의 `localhost`는 그대로
   `http://localhost:3000`으로 접근 가능합니다)
3. **토큰** 필드에 방금 복사한 값 붙여넣기
4. **Health 권한 요청** → 시스템 권한 다이얼로그 승인
5. 실제 Apple Watch로 기록된 러닝이 없다면(=시뮬레이터), **테스트 워크아웃 추가**
   버튼으로 기기 기록처럼 보이는(`HKWorkout.device != nil`) 샘플 러닝을 Health에 넣을 수
   있습니다 (Simulator 빌드에서만 보임)
6. **지금 동기화** → 최근 러닝 워크아웃을 가져와서, `device`가 있는 것만 서버로 전송

## 검증 로직이 있는 곳

`HealthKitManager.fetchRecentRunningWorkouts()`에서 각 워크아웃의 `deviceVerified`를
`workout.device != nil`로 판정합니다. Health 앱에서 사람이 직접 "운동 추가"로 입력한
기록은 `device`가 `nil`이라 여기서 걸러지고, 서버로 아예 전송되지 않습니다.

서버(`POST /api/activities/import`)도 `deviceVerified: false`인 항목은 한 번 더
거부하므로, 클라이언트 로직을 신뢰하되 서버에서도 이중으로 확인합니다.
