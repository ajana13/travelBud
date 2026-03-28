import Foundation

enum CantReason: String, Codable, CaseIterable, Hashable {
    case scheduleConflict
    case weather
    case noCompany
    case budgetThisWeek
    case healthReason
    case somethingElse

    var displayText: String {
        switch self {
        case .scheduleConflict: "Schedule conflict"
        case .weather: "Weather doesn't work"
        case .noCompany: "No one to go with"
        case .budgetThisWeek: "Budget this week"
        case .healthReason: "Not feeling up to it"
        case .somethingElse: "Something else"
        }
    }
}
