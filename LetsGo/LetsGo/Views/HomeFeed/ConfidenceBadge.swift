import SwiftUI

struct ConfidenceBadge: View {
    let label: ConfidenceLabel

    var body: some View {
        Text(label.displayText)
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(label.displayColor)
            .clipShape(Capsule())
    }
}
