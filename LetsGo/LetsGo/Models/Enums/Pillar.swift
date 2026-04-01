import Foundation

enum Pillar: String, Codable, CaseIterable, Hashable {
    case events
    case dining
    case outdoors

    var displayText: String {
        switch self {
        case .events: "Events"
        case .dining: "Dining"
        case .outdoors: "Outdoors"
        }
    }

    var iconName: String {
        switch self {
        case .events: "music.note"
        case .dining: "fork.knife"
        case .outdoors: "mountain.2"
        }
    }
}
