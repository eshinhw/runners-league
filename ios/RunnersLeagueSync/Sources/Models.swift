import Foundation

/// A running workout read from HealthKit, tagged with whether HealthKit
/// itself says it was recorded by a device (Apple Watch) rather than typed
/// into the Health app by hand.
struct VerifiedWorkout: Codable {
    let externalId: String
    let distanceM: Double
    let durationSec: Double
    let startedAt: String // ISO 8601
    let deviceVerified: Bool
    let deviceName: String?
}

struct ImportRequestBody: Codable {
    let workouts: [VerifiedWorkout]
}

struct ImportResponse: Codable {
    let imported: Int
    let skipped: Int
}
