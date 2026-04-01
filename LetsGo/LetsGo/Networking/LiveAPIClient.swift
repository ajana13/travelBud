import Foundation

final class LiveAPIClient: APIClientProtocol, @unchecked Sendable {

    private let baseURL: URL

    init(baseURL: URL) {
        self.baseURL = baseURL
    }

    func fetchFeed() async throws -> [RecommendationCard] {
        fatalError("LiveAPIClient.fetchFeed() not yet implemented. Connect to backend.")
    }

    func submitAction(_ action: FeedAction) async throws {
        fatalError("LiveAPIClient.submitAction() not yet implemented. Connect to backend.")
    }

    func fetchLearningPrompt(after recommendationID: String) async throws -> LearningQuestion? {
        fatalError("LiveAPIClient.fetchLearningPrompt() not yet implemented. Connect to backend.")
    }

    func submitLearningAnswer(_ answer: LearningAnswer) async throws {
        fatalError("LiveAPIClient.submitLearningAnswer() not yet implemented. Connect to backend.")
    }

    func submitPostActivityResponse(_ response: PostActivityResponse) async throws {
        fatalError("LiveAPIClient.submitPostActivityResponse() not yet implemented. Connect to backend.")
    }
}
