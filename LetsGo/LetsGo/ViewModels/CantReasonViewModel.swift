import Foundation
import Observation

@Observable
final class CantReasonViewModel {

    private let apiClient: any APIClientProtocol

    let card: RecommendationCard
    var selectedReason: CantReason?
    var freeText: String = ""
    var isSubmitting = false
    var didSubmit = false

    var canSubmit: Bool {
        selectedReason != nil
    }

    init(card: RecommendationCard, apiClient: any APIClientProtocol) {
        self.card = card
        self.apiClient = apiClient
    }

    func submitReason() async {
        guard let reason = selectedReason else { return }
        isSubmitting = true
        let action = FeedAction(
            actionType: .cant,
            recommendationID: card.id,
            reasonCode: reason.rawValue,
            reasonText: freeText.isEmpty ? nil : freeText
        )
        do {
            try await apiClient.submitAction(action)
            didSubmit = true
        } catch {
            // Silently fail for now
        }
        isSubmitting = false
    }
}
