import SwiftUI

struct PostActivityConfirmationView: View {
    @Environment(AppState.self) private var appState

    let card: RecommendationCard
    @State private var viewModel: PostActivityViewModel?

    var body: some View {
        VStack(spacing: 20) {
            // Done button
            HStack {
                Spacer()
                Button("Done") {
                    viewModel?.skip()
                    appState.dismissPostActivity()
                }
                .font(.body)
                .fontWeight(.medium)
                .foregroundStyle(Color.letsGoBlue)
            }
            .padding(.top, 8)

            // Event icon (reliable across simulator font/runtime differences)
            Image(systemName: card.pillar.iconName)
                .font(.system(size: 44, weight: .semibold))
                .foregroundStyle(Color.letsGoBlue)
                .padding(.top, 16)

            // Title
            Text("How was it?")
                .font(.title2)
                .fontWeight(.bold)

            Text("You said you were in for this. Help us get better at picking for you.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)

            // Card reference
            VStack(alignment: .leading, spacing: 4) {
                Text(card.title)
                    .font(.headline)
                Text("\(card.location) \u{00B7} \(card.availability)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 14))

            // Sentiment options
            Text("Did you end up going?")
                .font(.headline)

            VStack(spacing: 10) {
                ForEach(Sentiment.allCases, id: \.self) { sentiment in
                    Button {
                        viewModel?.selectedSentiment = sentiment
                        Task {
                            await viewModel?.submitResponse()
                            appState.dismissPostActivity()
                        }
                    } label: {
                        HStack(spacing: 12) {
                            // Use a fixed leading visual slot so emoji appears
                            // where an image thumbnail would normally go.
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color(.systemBackground))
                                Image(systemName: sentiment.iconName)
                                    .font(.system(size: 20, weight: .semibold))
                                    .foregroundStyle(Color.letsGoBlue)
                            }
                            .frame(width: 40, height: 40)

                            Text(sentiment.displayText)
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundStyle(.primary)

                            Spacer()
                        }
                        .padding(14)
                        .background(
                            viewModel?.selectedSentiment == sentiment
                                ? Color.letsGoBlue.opacity(0.06)
                                : Color(.systemGray6)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(
                                    viewModel?.selectedSentiment == sentiment
                                        ? Color.letsGoBlue
                                        : Color.clear,
                                    lineWidth: 2
                                )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                }
            }

            Spacer()

            Button {
                viewModel?.skip()
                appState.dismissPostActivity()
            } label: {
                Text("Skip")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(.bottom, 16)
        }
        .padding(.horizontal, 24)
        .task {
            if viewModel == nil {
                viewModel = PostActivityViewModel(card: card, apiClient: appState.apiClient)
            }
        }
    }
}

// Make Sentiment CaseIterable for ForEach
extension Sentiment: CaseIterable {
    static var allCases: [Sentiment] { [.loved, .okay, .didntGo] }
}
