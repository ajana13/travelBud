import Testing
@testable import LetsGo

@Suite("MockAPIClient Tests")
struct MockAPIClientTests {

    @Test("fetchFeed returns cards within elastic range")
    func fetchFeedReturnsCards() async throws {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let cards = try await client.fetchFeed()
        #expect(cards.count >= 3)
        #expect(cards.count <= 8)
    }

    @Test("fetchFeed returns default 6 cards")
    func fetchFeedDefaultCount() async throws {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let cards = try await client.fetchFeed()
        #expect(cards.count == 6)
    }

    @Test("submitAction does not throw")
    func submitAction() async throws {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let action = FeedAction(
            actionType: .imIn,
            recommendationID: "card-001",
            reasonCode: nil,
            reasonText: nil
        )
        try await client.submitAction(action)
    }

    @Test("fetchLearningPrompt returns question when session allows")
    func fetchLearningPromptReturnsQuestion() async throws {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let question = try await client.fetchLearningPrompt(after: "card-001")
        #expect(question != nil)
        #expect(question?.structuredAnswers.count == 4)
    }

    @Test("fetchLearningPrompt returns nil when session cap exceeded")
    func fetchLearningPromptRespectsSessionCap() async throws {
        let tracker = SessionTracker()
        tracker.recordLearningQuestionShown()
        tracker.recordLearningQuestionShown()
        let client = MockAPIClient(sessionTracker: tracker)
        let question = try await client.fetchLearningPrompt(after: "card-001")
        #expect(question == nil)
    }

    @Test("submitLearningAnswer does not throw")
    func submitLearningAnswer() async throws {
        let tracker = SessionTracker()
        let client = MockAPIClient(sessionTracker: tracker)
        let answer = LearningAnswer(
            questionID: "lq-001",
            selectedAnswerID: "a1",
            sourceSurface: "feed_followup",
            timestamp: Date()
        )
        try await client.submitLearningAnswer(answer)
    }
}
