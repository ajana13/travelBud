import Testing
@testable import LetsGo

@Suite("HomeFeedViewModel Tests")
struct HomeFeedViewModelTests {

    @Test("loadFeed populates cards")
    func loadFeedPopulatesCards() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = HomeFeedViewModel(apiClient: client)

        #expect(vm.cards.isEmpty)
        await vm.loadFeed()
        #expect(vm.cards.count == 6)
        #expect(vm.isLoading == false)
        #expect(vm.errorMessage == nil)
    }

    @Test("loadFeed sets isLoading")
    func loadFeedSetsLoading() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = HomeFeedViewModel(apiClient: client)

        #expect(vm.isLoading == false)
        await vm.loadFeed()
        #expect(vm.isLoading == false) // after completion
    }

    @Test("submitQuickAction does not throw")
    func submitQuickAction() async {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let vm = HomeFeedViewModel(apiClient: client)

        await vm.loadFeed()
        let card = vm.cards[0]
        await vm.submitQuickAction(.imIn, on: card)
        #expect(vm.errorMessage == nil)
    }
}
