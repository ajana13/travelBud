import Foundation

enum MockData {

    // MARK: - Feed Cards (8 Seattle-themed cards)

    static let sampleCards: [RecommendationCard] = [
        RecommendationCard(
            id: "card-001",
            pillar: .events,
            title: "Capitol Hill Jazz Night Itinerary",
            itineraryTheme: "Live music + cozy dinner",
            bestForTimeOfDay: "Evening",
            bestForSeason: "Fall / Winter",
            estimatedDuration: "3.5 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Indoor", "Transit-friendly", "Date night"],
            itineraryStops: [
                "Start with ramen at a quick spot near Capitol Hill Station",
                "Catch the 8:00pm jazz set at The Royal Room",
                "Wrap with dessert and tea on E Pike St"
            ],
            location: "Capitol Hill Loop",
            availability: "Best Fri/Sat after 6:30pm",
            priceBand: .budget,
            socialMode: "Solo or date",
            deepLinkURL: URL(string: "https://theroyalroomseattle.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "Curated for your frequent evening live-music activity pattern.",
                "Works well when you want one neighborhood, minimal travel, and no driving."
            ],
            itinerarySteps: [
                "Leave by 6:45pm to avoid parking rush around 7:30pm.",
                "Take Link light rail to Capitol Hill Station and walk 8 minutes to the venue.",
                "If driving, park near 15th Ave E and keep 10 extra minutes for a short uphill walk.",
                "Arrive by 7:30pm for check-in and to settle before the 8:00pm set."
            ],
            arrivalChecklist: [
                "Bring a photo ID for age-check at entry.",
                "Reserve tickets online in advance for weekend shows.",
                "Carry a light jacket; nights are cooler after the show.",
                "Set a rideshare pickup spot one block away to avoid venue congestion."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-002",
            pillar: .dining,
            title: "Sushi + Stroll + Nightcap",
            itineraryTheme: "Food-first neighborhood evening",
            bestForTimeOfDay: "Dinner",
            bestForSeason: "All season (rain-safe)",
            estimatedDuration: "2.5 to 3 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Indoor", "Walkable", "Low planning"],
            itineraryStops: [
                "Book dinner at Momiji and arrive before peak wait",
                "Take a 20-minute post-dinner walk through nearby side streets",
                "Finish at a quiet tea or cocktail spot nearby"
            ],
            location: "Capitol Hill Core",
            availability: "Best Tue-Sun 5:30pm onward",
            priceBand: .moderate,
            socialMode: "Date night",
            deepLinkURL: URL(string: "https://momijiseattle.com"),
            confidenceLabel: .learning,
            explanationFacts: [
                "Curated from your Japanese cuisine preference plus short-walk plans.",
                "Designed for flexible dinner timing without crossing neighborhoods."
            ],
            itinerarySteps: [
                "Plan to reach Capitol Hill by 6:30pm for shorter wait times.",
                "Ride Link to Capitol Hill Station, then walk 5 to 7 minutes to the restaurant.",
                "If driving, use paid street parking and check time limits near Pine St.",
                "Check in at host stand and expect a brief wait during peak dinner hours."
            ],
            arrivalChecklist: [
                "Book a table if available, especially Fri/Sat evenings.",
                "Review menu options in advance for dietary preferences.",
                "Bring a card payment method; some places are cashless.",
                "Keep 90 minutes in your plan for dinner and post-meal travel."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-003",
            pillar: .outdoors,
            title: "Sunrise Hike + Coffee Reset",
            itineraryTheme: "Morning outdoors recharge",
            bestForTimeOfDay: "Early Morning",
            bestForSeason: "Spring / Summer",
            estimatedDuration: "4 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Scenic", "Moderate effort", "Car needed"],
            itineraryStops: [
                "Grab takeaway coffee before leaving Seattle",
                "Hike Rattlesnake Ledge before late-morning crowds",
                "Stop in North Bend for a quick brunch on the way back"
            ],
            location: "North Bend Circuit",
            availability: "Best clear mornings before 11:00am",
            priceBand: .free,
            socialMode: "Solo or group",
            deepLinkURL: URL(string: "https://www.wta.org/go-hiking/hikes/rattle-snake-ledge"),
            confidenceLabel: .new,
            explanationFacts: [
                "Curated as a high-reward half-day plan with one anchor trail.",
                "Fits your moderate hike preference and early start behavior."
            ],
            itinerarySteps: [
                "Start from Seattle around 7:30am to beat trailhead crowds.",
                "Drive via I-90 E to North Bend and follow signs to Rattlesnake Lake parking.",
                "Park at the main lot and begin from the signed trailhead near the lake.",
                "Expect about 2 to 3 hours round trip including viewpoint stops."
            ],
            arrivalChecklist: [
                "Carry water, snacks, and a charged phone with offline map.",
                "Wear trail shoes; sections can be muddy after rain.",
                "Check weather and trail alerts before leaving.",
                "Pack a light layer; summit wind can feel colder."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-004",
            pillar: .events,
            title: "Pike Place Laughs + Dessert",
            itineraryTheme: "Market-area entertainment night",
            bestForTimeOfDay: "Evening",
            bestForSeason: "Fall / Winter",
            estimatedDuration: "3 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Indoor", "Group-friendly", "Weekend plan"],
            itineraryStops: [
                "Start with a casual bite near Post Alley",
                "Attend improv set at Unexpected Productions",
                "End with dessert or late coffee before heading home"
            ],
            location: "Pike Place Area",
            availability: "Best Fri/Sat 7:00pm to 10:30pm",
            priceBand: .budget,
            socialMode: "Group-friendly",
            deepLinkURL: URL(string: "https://unexpectedproductions.org"),
            confidenceLabel: .learning,
            explanationFacts: [
                "Curated for low-friction weekend entertainment in one compact area.",
                "Balances booked activity with casual food flexibility."
            ],
            itinerarySteps: [
                "Aim to arrive in Pike Place by 7:15pm for an 8:00pm show.",
                "Take light rail to Westlake, then walk downhill 12 to 15 minutes.",
                "If driving, use a nearby garage and allow extra time for weekend traffic.",
                "Join the ticket line early for better seat selection."
            ],
            arrivalChecklist: [
                "Purchase tickets online when possible.",
                "Bring ID for will-call pickup if required.",
                "Plan post-show transport before 10:00pm crowds.",
                "Keep cash/card for snacks or merch depending on venue policy."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: false
        ),
        RecommendationCard(
            id: "card-005",
            pillar: .dining,
            title: "Capitol Hill Flavor Trail",
            itineraryTheme: "Progressive small-plates evening",
            bestForTimeOfDay: "Dinner",
            bestForSeason: "All season",
            estimatedDuration: "3 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Food crawl", "Walkable", "Shareable"],
            itineraryStops: [
                "Kick off with drinks/snacks near Olive Way",
                "Do your main dinner stop at Kedai Makan",
                "Finish with a sweet stop nearby before transit back"
            ],
            location: "Capitol Hill Food Route",
            availability: "Best Wed-Sat evening",
            priceBand: .moderate,
            socialMode: "Small group",
            deepLinkURL: URL(string: "https://kedaimakanseattle.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "Curated around your preference for varied flavors over one long sit-down.",
                "Keeps budget moderate while still feeling like a special night."
            ],
            itinerarySteps: [
                "Target arrival between 6:00pm and 6:30pm to reduce queue time.",
                "Take Link to Capitol Hill Station and walk roughly 10 minutes.",
                "If driving, park farther out and walk in due to limited nearby spots.",
                "Order shareable plates first; kitchen pacing is better this way."
            ],
            arrivalChecklist: [
                "Check current hours; some weekdays may differ.",
                "Review allergy notes and ask staff for substitutions.",
                "Bring a backup nearby option for peak-hour overflow.",
                "Plan about 75 to 90 minutes for dinner service."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-006",
            pillar: .outdoors,
            title: "Lake Union Active Afternoon",
            itineraryTheme: "Water activity + waterfront break",
            bestForTimeOfDay: "Afternoon",
            bestForSeason: "Late Spring / Summer",
            estimatedDuration: "2 to 3 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Active", "Scenic", "Weather-dependent"],
            itineraryStops: [
                "Check in for kayak rental at South Lake Union",
                "Paddle beginner loop with skyline viewpoints",
                "Cool down with a waterfront snack after returning gear"
            ],
            location: "South Lake Union Waterfront",
            availability: "Best weekend afternoons with low wind",
            priceBand: .moderate,
            socialMode: "Solo or pair",
            deepLinkURL: URL(string: "https://nwoc.com"),
            confidenceLabel: .new,
            explanationFacts: [
                "Curated as a short, active city escape without a long drive.",
                "Aligns with your pattern of mixing movement + scenic downtime."
            ],
            itinerarySteps: [
                "Arrive 20 minutes before your rental slot for safety briefing.",
                "Use transit to South Lake Union or park in a nearby paid lot.",
                "Check in at the rental desk and store valuables in provided lockers.",
                "Follow the marked beginner route first, then extend toward Gas Works."
            ],
            arrivalChecklist: [
                "Bring sun protection and quick-dry layers.",
                "Carry water in a secure bottle.",
                "Confirm life-jacket sizing at check-in.",
                "Avoid loose electronics unless you have waterproof storage."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: false
        ),
        RecommendationCard(
            id: "card-007",
            pillar: .events,
            title: "Capitol Hill Late-Night Set",
            itineraryTheme: "Concert-first nightlife plan",
            bestForTimeOfDay: "Late Evening",
            bestForSeason: "All season",
            estimatedDuration: "3 to 4 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Music", "Late night", "Transit-safe return"],
            itineraryStops: [
                "Meet up for a quick pre-show meal",
                "Attend indie set at Neumos",
                "Optional short post-show stop before heading home"
            ],
            location: "Capitol Hill Night Strip",
            availability: "Best Fri nights after 8:30pm",
            priceBand: .moderate,
            socialMode: "Group-friendly",
            deepLinkURL: URL(string: "https://neumos.com"),
            confidenceLabel: .strongMatch,
            explanationFacts: [
                "Curated from your repeated late-evening live music behavior.",
                "Built to keep all movement in a small radius after dark."
            ],
            itinerarySteps: [
                "Get to the area by 8:30pm to avoid door-time bottlenecks.",
                "Ride Link to Capitol Hill and walk 6 to 8 minutes.",
                "Join entry line early if tickets are general admission.",
                "Find your return route before the show ends around late night."
            ],
            arrivalChecklist: [
                "Bring ID and digital ticket screenshot.",
                "Use ear protection for extended live sets.",
                "Carry a light layer for waiting outside.",
                "Set rideshare pickup 1 to 2 blocks away after the show."
            ],
            allowedActions: ActionType.allCases,
            isFollowUpEligible: true
        ),
        RecommendationCard(
            id: "card-008",
            pillar: .outdoors,
            title: "Alpine Day Itinerary",
            itineraryTheme: "Half-day mountain reset",
            bestForTimeOfDay: "Morning to Early Afternoon",
            bestForSeason: "Summer / Early Fall",
            estimatedDuration: "5 to 6 hours",
            imageURL: URL(string: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"),
            tags: ["Mountain", "Scenic", "Half-day"],
            itineraryStops: [
                "Depart early and reach Alpental trailhead before peak lot fill",
                "Complete Snow Lake hike with lakeside break",
                "Stop for a warm meal on return through Snoqualmie corridor"
            ],
            location: "Snoqualmie Pass Loop",
            availability: "Best on clear, low-rain days",
            priceBand: .free,
            socialMode: "Solo or group",
            deepLinkURL: URL(string: "https://www.wta.org/go-hiking/hikes/snow-lake-1"),
            confidenceLabel: .learning,
            explanationFacts: [
                "Curated as a full custom day plan rather than a single trail pin.",
                "Matches your preference for scenic effort with one post-hike reward stop."
            ],
            itinerarySteps: [
                "Leave Seattle by 7:00am for easier trailhead access.",
                "Drive east on I-90 to Snoqualmie Pass and park at Alpental lot.",
                "Follow Snow Lake trail markers; keep right at key junctions.",
                "Plan 4 to 5 hours round trip with breaks and photo stops."
            ],
            arrivalChecklist: [
                "Pack extra water and high-energy snacks.",
                "Carry a weatherproof shell; mountain weather shifts quickly.",
                "Download trail map for weak-signal sections.",
                "Bring trekking poles if you prefer downhill stability."
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
