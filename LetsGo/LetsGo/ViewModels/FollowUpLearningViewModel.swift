import Foundation
import Observation

@Observable
final class FollowUpLearningViewModel {

    private let apiClient: any APIClientProtocol
    private let sessionTracker: SessionTracker

    let recommendationID: String
    var question: LearningQuestion?
    var selectedAnswerID: String?
    var isLoading = false
    var isSubmitting = false
    var didComplete = false

    init(
        recommendationID: String,
        apiClient: any APIClientProtocol,
        sessionTracker: SessionTracker
    ) {
        self.recommendationID = recommendationID
        self.apiClient = apiClient
        self.sessionTracker = sessionTracker
    }

    func loadQuestion() async {
        guard sessionTracker.canShowLearningQuestion else {
            didComplete = true
            return
        }
        isLoading = true
        do {
            question = try await apiClient.fetchLearningPrompt(after: recommendationID)
            if question != nil {
                sessionTracker.recordLearningQuestionShown()
            } else {
                didComplete = true
            }
        } catch {
            didComplete = true
        }
        isLoading = false
    }

    func submitAnswer() async {
        guard let answerID = selectedAnswerID, let question else { return }
        isSubmitting = true
        let answer = LearningAnswer(
            questionID: question.id,
            selectedAnswerID: answerID,
            sourceSurface: "feed_followup",
            timestamp: Date()
        )
        do {
            try await apiClient.submitLearningAnswer(answer)
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
