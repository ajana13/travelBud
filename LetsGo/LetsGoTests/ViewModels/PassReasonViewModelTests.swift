import Testing
@testable import LetsGo

@Suite("PassReasonViewModel Tests")
struct PassReasonViewModelTests {

    private func makeViewModel() -> PassReasonViewModel {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let card = MockData.sampleCards[0]
        return PassReasonViewModel(card: card, apiClient: client)
    }

    @Test("canSubmit is false without selection")
    func canSubmitWithoutSelection() {
        let vm = makeViewModel()
        #expect(vm.canSubmit == false)
    }

    @Test("canSubmit is true with selection")
    func canSubmitWithSelection() {
        let vm = makeViewModel()
        vm.selectedReason = .notMyStyle
        #expect(vm.canSubmit == true)
    }

    @Test("submitReason sets didSubmit")
    func submitReasonSetsDidSubmit() async {
        let vm = makeViewModel()
        vm.selectedReason = .tooExpensive
        await vm.submitReason()
        #expect(vm.didSubmit == true)
    }

    @Test("submitReason includes free text when provided")
    func submitReasonWithFreeText() async {
        let vm = makeViewModel()
        vm.selectedReason = .somethingElse
        vm.freeText = "Just not in the mood"
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
