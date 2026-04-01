import Foundation

enum PriceBand: String, Codable, Hashable {
    case free
    case budget
    case moderate
    case premium

    var displayText: String {
        switch self {
        case .free: "Free"
        case .budget: "$"
        case .moderate: "$$"
        case .premium: "$$$"
        }
    }
}
