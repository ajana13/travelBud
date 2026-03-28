import SwiftUI

struct ExplanationSection: View {
    let facts: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Why we picked this")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.letsGoBlue)

            ForEach(facts, id: \.self) { fact in
                Text(fact)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .lineSpacing(2)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
