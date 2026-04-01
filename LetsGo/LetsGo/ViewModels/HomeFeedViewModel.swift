import Foundation
import Observation

@Observable
final class HomeFeedViewModel {

    private let apiClient: any APIClientProtocol

    var cards: [RecommendationCard] = []
    var isLoading = false
    var errorMessage: String?

    init(apiClient: any APIClientProtocol) {
        self.apiClient = apiClient
    }

    func loadFeed() async {
        isLoading = true
        errorMessage = nil
        do {
            cards = try await apiClient.fetchFeed()
        } catch {
            errorMessage = "Failed to load recommendations."
        }
        isLoading = false
    }

    func submitQuickAction(_ type: ActionType, on card: RecommendationCard) async {
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
    }
}
