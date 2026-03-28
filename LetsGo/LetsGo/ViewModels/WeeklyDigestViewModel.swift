import Foundation
import Observation

@Observable
final class WeeklyDigestViewModel {

    var digestItems: [RecommendationCard] = []
    var isLoading = false

    func loadDigest() async {
        isLoading = true
        try? await Task.sleep(for: .milliseconds(300))
        digestItems = MockData.digestItems
        isLoading = false
    }
}
