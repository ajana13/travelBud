import SwiftUI

struct WeeklyDigestView: View {
    @State private var viewModel = WeeklyDigestViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                VStack(spacing: 4) {
                    Text("LetsGo")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundStyle(.letsGoBlue)

                    Text("Weekly Picks \u{00B7} Mar 28")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 16)

                Text("Your Week Ahead")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("3 picks we think you'll enjoy")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                // Digest items
                if viewModel.isLoading {
                    ProgressView()
                        .padding(.top, 40)
                } else {
                    ForEach(viewModel.digestItems) { card in
                        DigestItemView(card: card)
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 24)
        }
        .background(Color(.systemBackground))
        .navigationTitle("Digest")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadDigest()
        }
    }
}
