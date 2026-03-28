import Foundation
import Observation

@Observable
final class SessionTracker {

    private(set) var learningQuestionsShown: Int = 0
    let maxLearningQuestionsPerSession: Int = 2

    var canShowLearningQuestion: Bool {
        learningQuestionsShown < maxLearningQuestionsPerSession
    }

    func recordLearningQuestionShown() {
        learningQuestionsShown += 1
    }

    func resetSession() {
        learningQuestionsShown = 0
    }
}
