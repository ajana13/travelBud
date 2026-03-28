import Foundation
import Observation

@Observable
final class AppState {

    let apiClient: any APIClientProtocol
    let sessionTracker: SessionTracker
    var pendingPostActivityCards: [RecommendationCard] = []
    var showPostActivitySheet: Bool = false

    init(
        apiClient: any APIClientProtocol? = nil,
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
}
