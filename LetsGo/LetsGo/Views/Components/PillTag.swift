import SwiftUI

struct PillTag: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color(.systemGray6))
            .foregroundStyle(.secondary)
            .clipShape(Capsule())
    }
}
