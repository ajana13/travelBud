import Testing
@testable import LetsGo

@Suite("RecommendationCard Tests")
struct RecommendationCardTests {

    @Test("Card has correct properties")
    func cardProperties() {
        let card = MockData.sampleCards[0]
        #expect(card.id == "card-001")
        #expect(card.pillar == .events)
        #expect(card.title == "Jazz at The Royal Room")
        #expect(card.confidenceLabel == .strongMatch)
        #expect(card.isFollowUpEligible == true)
        #expect(card.allowedActions.count == 4)
    }

    @Test("Card conforms to Hashable")
    func cardHashable() {
        let card1 = MockData.sampleCards[0]
        let card2 = MockData.sampleCards[0]
        #expect(card1 == card2)
        #expect(card1.hashValue == card2.hashValue)
    }

    @Test("Card conforms to Identifiable")
    func cardIdentifiable() {
        let card = MockData.sampleCards[0]
        #expect(card.id == "card-001")
    }

    @Test("All sample cards have unique IDs")
    func uniqueIDs() {
        let ids = MockData.sampleCards.map(\.id)
        let uniqueIds = Set(ids)
        #expect(ids.count == uniqueIds.count)
    }

    @Test("Default feed returns 6 cards")
    func defaultFeedSize() {
        let feed = MockData.defaultFeed
        #expect(feed.count == 6)
    }

    @Test("Sample cards cover all pillars")
    func allPillarsCovered() {
        let pillars = Set(MockData.sampleCards.map(\.pillar))
        #expect(pillars.contains(.events))
        #expect(pillars.contains(.dining))
        #expect(pillars.contains(.outdoors))
    }

    @Test("Sample cards cover all confidence labels")
    func allConfidenceLabelsCovered() {
        let labels = Set(MockData.sampleCards.map(\.confidenceLabel))
        #expect(labels.contains(.strongMatch))
        #expect(labels.contains(.learning))
        #expect(labels.contains(.new))
    }
}
