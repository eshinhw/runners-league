import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "서버 주소가 올바르지 않습니다."
        case .server(let message):
            return message
        }
    }
}

struct APIClient {
    let baseURL: URL
    let token: String

    func importWorkouts(_ workouts: [VerifiedWorkout]) async throws -> ImportResponse {
        let url = baseURL.appendingPathComponent("api/activities/import")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(ImportRequestBody(workouts: workouts))

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.server("서버 응답을 확인할 수 없습니다.")
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "동기화에 실패했습니다 (\(http.statusCode))"
            throw APIError.server(message)
        }
        return try JSONDecoder().decode(ImportResponse.self, from: data)
    }
}
