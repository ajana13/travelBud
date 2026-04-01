import Foundation
import Observation

@Observable
final class PassReasonViewModel {

    private let apiClient: any APIClientProtocol

    let card: RecommendationCard
    var selectedReason: PassReason?
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
            actionType: .pass,
            recommendationID: card.id,
            reasonCode: reason.rawValue,
            reasonText: freeText.isEmpty ? nil : freeText
        )
        do {
            try await apiClient.submitAction(action)
            didSubmit = true
        } catch {
            // Silently fail for now; action will be retried
        }
        isSubmitting = false
    }
}
