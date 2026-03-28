import Foundation

protocol APIClientProtocol: Sendable {
    func fetchFeed() async throws -> [RecommendationCard]
    func submitAction(_ action: FeedAction) async throws
    func fetchLearningPrompt(after recommendationID: String) async throws -> LearningQuestion?
    func submitLearningAnswer(_ answer: LearningAnswer) async throws
    func submitPostActivityResponse(_ response: PostActivityResponse) async throws
}
