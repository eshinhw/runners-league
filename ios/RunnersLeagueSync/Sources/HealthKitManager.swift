import Foundation
import HealthKit

@MainActor
final class HealthKitManager: ObservableObject {
    private let store = HKHealthStore()

    @Published var lastError: String?

    var isHealthDataAvailable: Bool { HKHealthStore.isHealthDataAvailable() }

    func requestAuthorization() async {
        guard isHealthDataAvailable else {
            lastError = "이 기기에서는 Health 데이터를 사용할 수 없습니다."
            return
        }

        let workoutType = HKObjectType.workoutType()
        let distanceType = HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!

        do {
            try await store.requestAuthorization(
                toShare: [workoutType, HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!],
                read: [workoutType, distanceType]
            )
            lastError = nil
        } catch {
            lastError = error.localizedDescription
        }
    }

    /// Reads recent running workouts and tags each one with whether it was
    /// actually recorded by a device. `HKWorkout.device` is the one signal
    /// HealthKit gives us for this — it's non-nil when a watch (or another
    /// app writing on a device's behalf) recorded the workout, and nil when
    /// someone typed a workout into the Health app by hand.
    func fetchRecentRunningWorkouts(limit: Int = 30) async throws -> [VerifiedWorkout] {
        let predicate = HKQuery.predicateForWorkouts(with: .running)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: HKObjectType.workoutType(),
                predicate: predicate,
                limit: limit,
                sortDescriptors: [sort]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                let workouts = (samples as? [HKWorkout]) ?? []
                let isoFormatter = ISO8601DateFormatter()

                let mapped = workouts.map { workout -> VerifiedWorkout in
                    let distance = workout.totalDistance?.doubleValue(for: .meter()) ?? 0
                    return VerifiedWorkout(
                        externalId: workout.uuid.uuidString,
                        distanceM: distance,
                        durationSec: workout.duration,
                        startedAt: isoFormatter.string(from: workout.startDate),
                        deviceVerified: workout.device != nil,
                        deviceName: workout.device?.name
                    )
                }
                continuation.resume(returning: mapped)
            }
            store.execute(query)
        }
    }

    /// DEV ONLY — writes a synthetic device-recorded run into the
    /// Simulator's Health store so the sync pipeline can be tested end to
    /// end without a paired Apple Watch. Uses HKWorkoutBuilder with an
    /// explicit HKDevice so the resulting workout looks exactly like one
    /// a real watch would have recorded (device != nil).
    func insertTestWorkout() async throws {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .running
        configuration.locationType = .outdoor

        let device = HKDevice(
            name: "Apple Watch",
            manufacturer: "Apple Inc.",
            model: "Watch (Simulator test data)",
            hardwareVersion: nil,
            firmwareVersion: nil,
            softwareVersion: nil,
            localIdentifier: nil,
            udiDeviceIdentifier: nil
        )

        let builder = HKWorkoutBuilder(healthStore: store, configuration: configuration, device: device)

        let end = Date()
        let start = end.addingTimeInterval(-32 * 60)

        try await builder.beginCollection(at: start)

        let distanceType = HKQuantityType(.distanceWalkingRunning)
        let distanceSample = HKQuantitySample(
            type: distanceType,
            quantity: HKQuantity(unit: .meter(), doubleValue: 7500),
            start: start,
            end: end
        )
        try await builder.addSamples([distanceSample])

        try await builder.endCollection(at: end)
        _ = try await builder.finishWorkout()
    }
}
