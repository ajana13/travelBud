import Testing
@testable import LetsGo

@Suite("CantReasonViewModel Tests")
struct CantReasonViewModelTests {

    private func makeViewModel() -> CantReasonViewModel {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let card = MockData.sampleCards[0]
        return CantReasonViewModel(card: card, apiClient: client)
    }

    @Test("canSubmit is false without selection")
    func canSubmitWithoutSelection() {
        let vm = makeViewModel()
        #expect(vm.canSubmit == false)
    }

    @Test("canSubmit is true with selection")
    func canSubmitWithSelection() {
        let vm = makeViewModel()
        vm.selectedReason = .scheduleConflict
        #expect(vm.canSubmit == true)
    }

    @Test("submitReason sets didSubmit")
    func submitReasonSetsDidSubmit() async {
        let vm = makeViewModel()
        vm.selectedReason = .weather
        await vm.submitReason()
        #expect(vm.didSubmit == true)
    }

    @Test("submitReason does nothing without selection")
    func submitReasonWithoutSelection() async {
        let vm = makeViewModel()
        await vm.submitReason()
        #expect(vm.didSubmit == false)
    }
}
