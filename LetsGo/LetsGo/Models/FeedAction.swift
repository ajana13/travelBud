import Foundation

struct FeedAction: Codable {
    let actionType: ActionType
    let recommendationID: String
    let reasonCode: String?
    let reasonText: String?
}
