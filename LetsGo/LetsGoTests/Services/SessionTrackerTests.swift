import Testing
@testable import LetsGo

@Suite("SessionTracker Tests")
struct SessionTrackerTests {

    @Test("Initial state allows learning questions")
    func initialState() {
        let tracker = SessionTracker()
        #expect(tracker.canShowLearningQuestion == true)
        #expect(tracker.learningQuestionsShown == 0)
    }

    @Test("Recording increments count")
    func recordIncrementsCount() {
        let tracker = SessionTracker()
        tracker.recordLearningQuestionShown()
        #expect(tracker.learningQuestionsShown == 1)
        #expect(tracker.canShowLearningQuestion == true)
    }

    @Test("Cap is enforced at 2")
    func capEnforced() {
        let tracker = SessionTracker()
        tracker.recordLearningQuestionShown()
        tracker.recordLearningQuestionShown()
        #expect(tracker.learningQuestionsShown == 2)
        #expect(tracker.canShowLearningQuestion == false)
    }

    @Test("Reset clears state")
    func resetClears() {
        let tracker = SessionTracker()
        tracker.recordLearningQuestionShown()
        tracker.recordLearningQuestionShown()
        #expect(tracker.canShowLearningQuestion == false)
        tracker.resetSession()
        #expect(tracker.canShowLearningQuestion == true)
        #expect(tracker.learningQuestionsShown == 0)
    }

    @Test("Max learning questions per session is 2")
    func maxValue() {
        let tracker = SessionTracker()
        #expect(tracker.maxLearningQuestionsPerSession == 2)
    }
}
