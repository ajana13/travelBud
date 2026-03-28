import Foundation

enum MockData {

    // MARK: - Feed Cards (8 Seattle-themed cards)

    static let sampleCards: [RecommendationCard] = [
        RecommendationCard(
            id: "card-001",
            pillar: .events,
            title: "Jazz at The Royal Room",
            imageURL: nil,
            tags: ["Live Music", "Jazz", "Evening"],
            location: "Capitol Hill",
            availability: "Sat 8pm",
            priceBand: .budget,
            socialMode: "Solo-friendly",
            deepLinkURL: URL(string: "https://theroyalroomseattle.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "You enjoy live music and have liked jazz events before.",
                "Capitol Hill is one of your preferred neighborhoods."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-002",
            pillar: .dining,
            title: "Momiji Sushi",
            imageURL: nil,
            tags: ["Japanese", "Sushi", "Date night"],
            location: "Capitol Hill",
            availability: "Open now",
            priceBand: .moderate,
            socialMode: "Date night",
            deepLinkURL: URL(string: "https://momijiseattle.com"),
            confidenceLabel: .learning,
            explanationFacts: [
                "Based on your interest in Japanese cuisine.",
                "Highly rated for vegetarian options."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-003",
            pillar: .outdoors,
            title: "Rattlesnake Ledge Trail",
            imageURL: nil,
            tags: ["Hiking", "Scenic", "Moderate"],
            location: "North Bend",
            availability: "Anytime",
            priceBand: .free,
            socialMode: "Solo or group",
            deepLinkURL: URL(string: "https://www.wta.org/go-hiking/hikes/rattle-snake-ledge"),
            confidenceLabel: .new,
            explanationFacts: [
                "Exploring: a popular trail we haven't suggested yet.",
                "Moderate difficulty matches your preference."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-004",
            pillar: .events,
            title: "Comedy Night at Unexpected Productions",
            imageURL: nil,
            tags: ["Comedy", "Improv", "Weekend"],
            location: "Pike Place Market",
            availability: "Fri & Sat 8pm",
            priceBand: .budget,
            socialMode: "Group-friendly",
            deepLinkURL: URL(string: "https://unexpectedproductions.org"),
            confidenceLabel: .learning,
            explanationFacts: [
                "You've shown interest in evening entertainment.",
                "Improv comedy is popular in your area."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: false
        ),
        RecommendationCard(
            id: "card-005",
            pillar: .dining,
            title: "Kedai Makan",
            imageURL: nil,
            tags: ["Malaysian", "Vegetarian", "Small plates"],
            location: "Capitol Hill",
            availability: "Dinner service",
            priceBand: .moderate,
            socialMode: "Small group",
            deepLinkURL: URL(string: "https://kedaimakanseattle.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "Malaysian-inspired small plates with vegetarian options.",
                "Matches your preference for moderate pricing."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-006",
            pillar: .outdoors,
            title: "Kayaking on Lake Union",
            imageURL: nil,
            tags: ["Water sports", "Scenic", "Active"],
            location: "South Lake Union",
            availability: "Weekends 9am-5pm",
            priceBand: .moderate,
            socialMode: "Solo or pair",
            deepLinkURL: URL(string: "https://nwoc.com"),
            confidenceLabel: .new,
            explanationFacts: [
                "A new outdoor experience on the water.",
                "Great views of the Seattle skyline."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: false
        ),
        RecommendationCard(
            id: "card-007",
            pillar: .events,
            title: "Indie Night at Neumos",
            imageURL: nil,
            tags: ["Indie Rock", "Live Music", "Late night"],
            location: "Capitol Hill",
            availability: "Fri 9pm",
            priceBand: .moderate,
            socialMode: "Group-friendly",
            deepLinkURL: URL(string: "https://neumos.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "You've liked similar live music venues.",
                "Indie rock matches your music taste."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-008",
            pillar: .outdoors,
            title: "Snow Lake Trail",
            imageURL: nil,
            tags: ["Hiking", "Alpine", "Views"],
            location: "Snoqualmie Pass",
            availability: "Weather permitting",
            priceBand: .free,
            socialMode: "Solo or group",
            deepLinkURL: URL(string: "https://www.wta.org/go-hiking/hikes/snow-lake-1"),
            confidenceLabel: .learning,
            explanationFacts: [
                "Moderate lake hike with great views.",
                "Similar to trails you've enjoyed."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
    ]

    /// Default feed returns 6 cards (elastic default)
    static var defaultFeed: [RecommendationCard] {
        Array(sampleCards.prefix(6))
    }

    // MARK: - Learning Questions

    static let sampleLearningQuestions: [LearningQuestion] = [
        LearningQuestion(
            id: "lq-001",
            questionText: "When you go out for dinner, what kind of vibe do you usually prefer?",
            structuredAnswers: [
                StructuredAnswer(id: "a1", text: "Casual and laid-back"),
                StructuredAnswer(id: "a2", text: "Trendy and buzzy"),
                StructuredAnswer(id: "a3", text: "Quiet and intimate"),
                StructuredAnswer(id: "a4", text: "Lively with groups"),
            ],
            isComparison: false,
            linkedRecommendationID: nil
        ),
        LearningQuestion(
            id: "lq-002",
            questionText: "For outdoor activities, do you prefer going solo or with company?",
            structuredAnswers: [
                StructuredAnswer(id: "b1", text: "Solo — I enjoy the quiet"),
                StructuredAnswer(id: "b2", text: "With a friend or partner"),
                StructuredAnswer(id: "b3", text: "Small group (3-5)"),
                StructuredAnswer(id: "b4", text: "Depends on the activity"),
            ],
            isComparison: false,
            linkedRecommendationID: nil
        ),
    ]

    // MARK: - Notification Previews

    static let sampleNotificationPreviews: [NotificationPreview] = [
        NotificationPreview(
            id: "notif-001",
            type: .recommendation,
            title: "Tonight: Jazz at The Royal Room",
            body: "We think you'd love tonight's set in Capitol Hill. Tickets from $15.",
            venueName: "The Royal Room",
            priceInfo: "$15",
            timeAgo: "12m ago",
            ttlMinutes: nil
        ),
        NotificationPreview(
            id: "notif-002",
            type: .learning,
            title: "Quick question",
            body: "When you eat out, do you prefer trying new places or sticking to favorites?",
            venueName: nil,
            priceInfo: nil,
            timeAgo: "2h ago",
            ttlMinutes: 60
        ),
    ]

    // MARK: - Digest Items (3 picks)

    static let digestItems: [RecommendationCard] = [
        sampleCards[4], // Kedai Makan
        sampleCards[6], // Indie Night at Neumos
        sampleCards[7], // Snow Lake Trail
    ]

    // MARK: - Post-Activity Card

    static let postActivityCard: RecommendationCard = sampleCards[0] // Jazz at The Royal Room
}
