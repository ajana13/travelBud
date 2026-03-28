import Foundation

struct StructuredAnswer: Identifiable, Codable, Hashable {
    let id: String
    let text: String
}

struct LearningQuestion: Identifiable, Codable, Hashable {
    let id: String
    let questionText: String
    let structuredAnswers: [StructuredAnswer]
    let isComparison: Bool
    let linkedRecommendationID: String?
}
