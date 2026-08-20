import SwiftUI

struct ContentView: View {
    @StateObject private var health = HealthKitManager()
    @AppStorage("rl_server_url") private var serverURLString = "http://localhost:3000"
    @AppStorage("rl_device_token") private var token = ""

    @State private var isSyncing = false
    @State private var statusMessage: String?
    @State private var isError = false

    var body: some View {
        NavigationStack {
            Form {
                Section("서버") {
                    TextField("서버 주소", text: $serverURLString)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                    SecureField("Connections 페이지에서 발급한 토큰", text: $token)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }

                Section("Health 권한") {
                    Button("Health 권한 요청") {
                        Task { await health.requestAuthorization() }
                    }
                    if let error = health.lastError {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }

                Section("동기화") {
                    Button {
                        Task { await sync() }
                    } label: {
                        if isSyncing {
                            ProgressView()
                        } else {
                            Text("지금 동기화")
                        }
                    }
                    .disabled(isSyncing || token.isEmpty)

                    if let statusMessage {
                        Text(statusMessage)
                            .font(.caption)
                            .foregroundStyle(isError ? .red : .secondary)
                    }
                }

                #if targetEnvironment(simulator)
                Section {
                    Button("테스트 워크아웃 추가") {
                        Task { await insertTestWorkout() }
                    }
                } header: {
                    Text("개발용 (Simulator 전용)")
                } footer: {
                    Text("실제 Apple Watch 없이도 파이프라인을 테스트할 수 있도록, 기기로 기록된 것처럼 보이는(device != nil) 샘플 러닝을 Health에 추가합니다.")
                }
                #endif
            }
            .navigationTitle("Runners League Sync")
        }
    }

    private func sync() async {
        guard let baseURL = URL(string: serverURLString) else {
            statusMessage = "서버 주소가 올바르지 않습니다."
            isError = true
            return
        }

        isSyncing = true
        defer { isSyncing = false }

        do {
            let allWorkouts = try await health.fetchRecentRunningWorkouts()
            let verified = allWorkouts.filter { $0.deviceVerified }
            let skippedLocally = allWorkouts.count - verified.count

            let client = APIClient(baseURL: baseURL, token: token)
            let result = try await client.importWorkouts(verified)

            statusMessage = "가져옴 \(result.imported)건 · 서버에서 스킵 \(result.skipped)건" +
                (skippedLocally > 0 ? " · 기기 미기록으로 제외 \(skippedLocally)건" : "")
            isError = false
        } catch {
            statusMessage = error.localizedDescription
            isError = true
        }
    }

    private func insertTestWorkout() async {
        do {
            try await health.insertTestWorkout()
            statusMessage = "테스트 워크아웃을 Health에 추가했습니다. 이제 동기화를 눌러보세요."
            isError = false
        } catch {
            statusMessage = error.localizedDescription
            isError = true
        }
    }
}

#Preview {
    ContentView()
}
