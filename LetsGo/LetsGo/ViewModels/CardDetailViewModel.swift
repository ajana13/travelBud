import Foundation
import Observation

@Observable
final class CardDetailViewModel {

    private let apiClient: any APIClientProtocol

    let card: RecommendationCard
    var isSubmitting = false
    var errorMessage: String?

    init(card: RecommendationCard, apiClient: any APIClientProtocol) {
        self.card = card
        self.apiClient = apiClient
    }

    func performAction(_ type: ActionType) async {
        isSubmitting = true
        let action = FeedAction(
            actionType: type,
            recommendationID: card.id,
            reasonCode: nil,
            reasonText: nil
        )
        do {
            try await apiClient.submitAction(action)
        } catch {
            errorMessage = "Failed to submit action."
        }
        isSubmitting = false
    }
}
