import Testing
@testable import LetsGo

@Suite("FollowUpLearningViewModel Tests")
struct FollowUpLearningViewModelTests {

    @Test("loadQuestion returns question when session allows")
    func loadQuestionReturnsQuestion() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = FollowUpLearningViewModel(
            recommendationID: "card-001",
            apiClient: client,
            sessionTracker: tracker
        )
        await vm.loadQuestion()
        #expect(vm.question != nil)
        #expect(vm.didComplete == false)
    }

    @Test("loadQuestion sets didComplete when session cap exceeded")
    func loadQuestionRespectsSessionCap() async {
        let tracker = SessionTracker()
        tracker.recordLearningQuestionShown()
        tracker.recordLearningQuestionShown()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = FollowUpLearningViewModel(
            recommendationID: "card-001",
            apiClient: client,
            sessionTracker: tracker
        )
        await vm.loadQuestion()
        #expect(vm.question == nil)
        #expect(vm.didComplete == true)
    }

    @Test("submitAnswer sets didComplete")
    func submitAnswerSetsDidComplete() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = FollowUpLearningViewModel(
            recommendationID: "card-001",
            apiClient: client,
            sessionTracker: tracker
        )
        await vm.loadQuestion()
        vm.selectedAnswerID = vm.question?.structuredAnswers.first?.id
        await vm.submitAnswer()
        #expect(vm.didComplete == true)
    }

    @Test("skip sets didComplete without submitting")
    func skipSetsDidComplete() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = FollowUpLearningViewModel(
            recommendationID: "card-001",
            apiClient: client,
            sessionTracker: tracker
        )
        await vm.loadQuestion()
        vm.skip()
        #expect(vm.didComplete == true)
    }
}
