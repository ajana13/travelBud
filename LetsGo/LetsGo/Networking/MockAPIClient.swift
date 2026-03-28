import Foundation

final class MockAPIClient: APIClientProtocol, @unchecked Sendable {

    private let sessionTracker: SessionTracker
    private var submittedActions: [FeedAction] = []
    private var submittedAnswers: [LearningAnswer] = []
    private var questionIndex = 0

    init(sessionTracker: SessionTracker) {
        self.sessionTracker = sessionTracker
    }

    func fetchFeed() async throws -> [RecommendationCard] {
        try await Task.sleep(for: .milliseconds(300))
        return MockData.defaultFeed
    }

    func submitAction(_ action: FeedAction) async throws {
        try await Task.sleep(for: .milliseconds(200))
        submittedActions.append(action)
    }

    func fetchLearningPrompt(after recommendationID: String) async throws -> LearningQuestion? {
        try await Task.sleep(for: .milliseconds(200))

        guard sessionTracker.canShowLearningQuestion else {
            return nil
        }

        let questions = MockData.sampleLearningQuestions
        guard questionIndex < questions.count else { return nil }

        var question = questions[questionIndex]
        question = LearningQuestion(
            id: question.id,
            questionText: question.questionText,
            structuredAnswers: question.structuredAnswers,
            isComparison: question.isComparison,
            linkedRecommendationID: recommendationID
        )
        questionIndex += 1
        return question
    }

    func submitLearningAnswer(_ answer: LearningAnswer) async throws {
        try await Task.sleep(for: .milliseconds(200))
        submittedAnswers.append(answer)
    }

    func submitPostActivityResponse(_ response: PostActivityResponse) async throws {
        try await Task.sleep(for: .milliseconds(200))
    }
}
