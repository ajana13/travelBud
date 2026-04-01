import Foundation
import Observation

@Observable
final class NotificationPreviewViewModel {
    let previews: [NotificationPreview] = MockData.sampleNotificationPreviews
}
