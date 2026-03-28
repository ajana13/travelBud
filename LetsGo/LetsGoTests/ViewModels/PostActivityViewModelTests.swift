import Testing
@testable import LetsGo

@Suite("PostActivityViewModel Tests")
struct PostActivityViewModelTests {

    private func makeViewModel() -> PostActivityViewModel {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let card = MockData.sampleCards[0]
        return PostActivityViewModel(card: card, apiClient: client)
    }

    @Test("Initial state has no sentiment selected")
    func initialState() {
        let vm = makeViewModel()
        #expect(vm.selectedSentiment == nil)
        #expect(vm.didComplete == false)
    }

    @Test("submitResponse sets didComplete")
    func submitResponseSetsDidComplete() async {
        let vm = makeViewModel()
        vm.selectedSentiment = .loved
        await vm.submitResponse()
        #expect(vm.didComplete == true)
    }

    @Test("submitResponse does nothing without sentiment")
    func submitResponseWithoutSentiment() async {
        let vm = makeViewModel()
        await vm.submitResponse()
        #expect(vm.didComplete == false)
    }

    @Test("skip sets didComplete")
    func skipSetsDidComplete() {
        let vm = makeViewModel()
        vm.skip()
        #expect(vm.didComplete == true)
    }
}
