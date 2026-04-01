import Foundation
import Observation

@Observable
final class AppState {

    let apiClient: any APIClientProtocol
    let sessionTracker: SessionTracker
    var pendingPostActivityCards: [RecommendationCard] = []
    var showPostActivitySheet: Bool = false
    var handledRecommendationIDs: Set<String> = []

    init(
        apiClient: (any APIClientProtocol)? = nil,
        sessionTracker: SessionTracker = SessionTracker()
    ) {
        self.sessionTracker = sessionTracker
        self.apiClient = apiClient ?? MockAPIClient(sessionTracker: sessionTracker)
    }

    func registerImIn(card: RecommendationCard) {
        pendingPostActivityCards.append(card)
    }

    func triggerPostActivityIfNeeded() {
        showPostActivitySheet = !pendingPostActivityCards.isEmpty
    }

    func dismissPostActivity() {
        if !pendingPostActivityCards.isEmpty {
            pendingPostActivityCards.removeFirst()
        }
        showPostActivitySheet = !pendingPostActivityCards.isEmpty
    }

    func markRecommendationHandled(_ card: RecommendationCard) {
        handledRecommendationIDs.insert(card.id)
    }

    func resetHandledRecommendations() {
        handledRecommendationIDs.removeAll()
    }
}
