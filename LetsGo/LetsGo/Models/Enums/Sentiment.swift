import Foundation

enum Sentiment: String, Codable, Hashable {
    case loved
    case okay
    case didntGo

    var displayText: String {
        switch self {
        case .loved: "I went and loved it"
        case .okay: "I went and didn't like it"
        case .didntGo: "Didn't end up going"
        }
    }

    var emoji: String {
        switch self {
        case .loved: "😍"
        case .okay: "👎"
        case .didntGo: "👋"
        }
    }

    var iconName: String {
        switch self {
        case .loved: "heart.fill"
        case .okay: "hand.thumbsdown.fill"
        case .didntGo: "xmark.circle.fill"
        }
    }
}
