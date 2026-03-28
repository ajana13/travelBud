import Foundation
import Observation

@Observable
final class PostActivityViewModel {

    private let apiClient: any APIClientProtocol

    let card: RecommendationCard
    var selectedSentiment: Sentiment?
    var isSubmitting = false
    var didComplete = false

    init(card: RecommendationCard, apiClient: any APIClientProtocol) {
        self.card = card
        self.apiClient = apiClient
    }

    func submitResponse() async {
        guard let sentiment = selectedSentiment else { return }
        isSubmitting = true
        let response = PostActivityResponse(
            recommendationID: card.id,
            sentiment: sentiment
        )
        do {
            try await apiClient.submitPostActivityResponse(response)
        } catch {
            // Silently fail
        }
        isSubmitting = false
        didComplete = true
    }

    func skip() {
        didComplete = true
    }
}
