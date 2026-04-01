import Testing
@testable import LetsGo

@Suite("Enum Tests")
struct EnumTests {

    @Test("Pillar has 3 cases")
    func pillarCases() {
        #expect(Pillar.allCases.count == 3)
    }

    @Test("Pillar display texts are correct")
    func pillarDisplayText() {
        #expect(Pillar.events.displayText == "Events")
        #expect(Pillar.dining.displayText == "Dining")
        #expect(Pillar.outdoors.displayText == "Outdoors")
    }

    @Test("ConfidenceLabel display texts are correct")
    func confidenceLabelDisplayText() {
        #expect(ConfidenceLabel.strongMatch.displayText == "Strong match")
        #expect(ConfidenceLabel.learning.displayText == "Learning")
        #expect(ConfidenceLabel.new.displayText == "New")
    }

    @Test("ActionType has 4 cases")
    func actionTypeCases() {
        #expect(ActionType.allCases.count == 4)
    }

    @Test("Only Pass and Can't require reasons")
    func requiresReason() {
        #expect(ActionType.imIn.requiresReason == false)
        #expect(ActionType.maybe.requiresReason == false)
        #expect(ActionType.pass.requiresReason == true)
        #expect(ActionType.cant.requiresReason == true)
    }

    @Test("PassReason has 6 cases")
    func passReasonCases() {
        #expect(PassReason.allCases.count == 6)
    }

    @Test("CantReason has 6 cases")
    func cantReasonCases() {
        #expect(CantReason.allCases.count == 6)
    }

    @Test("Sentiment has 3 cases")
    func sentimentCases() {
        #expect(Sentiment.allCases.count == 3)
    }

    @Test("PriceBand display texts")
    func priceBandDisplay() {
        #expect(PriceBand.free.displayText == "Free")
        #expect(PriceBand.budget.displayText == "$")
        #expect(PriceBand.moderate.displayText == "$$")
        #expect(PriceBand.premium.displayText == "$$$")
    }
}
