import Foundation

struct RecommendationCard: Identifiable, Codable, Hashable {
    let id: String
    let pillar: Pillar
    let title: String
    let imageURL: URL?
    let tags: [String]
    let location: String
    let availability: String
    let priceBand: PriceBand
    let socialMode: String
    let deepLinkURL: URL?
    let confidenceLabel: ConfidenceLabel
    let explanationFacts: [String]
    let allowedActions: [ActionType]
    let isFollowUpEligible: Bool
}
