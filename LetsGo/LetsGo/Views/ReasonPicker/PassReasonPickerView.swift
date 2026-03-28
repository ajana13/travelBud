import SwiftUI

struct PassReasonPickerView: View {
    @Environment(AppState.self) private var appState
    @Environment(AppRouter.self) private var router

    let card: RecommendationCard
    @State private var viewModel: PassReasonViewModel?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Not for you?")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Help us understand \u{2014} this stays private and helps improve your recommendations.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                VStack(spacing: 8) {
                    ForEach(PassReason.allCases, id: \.self) { reason in
                        Button {
                            viewModel?.selectedReason = reason
                        } label: {
                            HStack(spacing: 12) {
                                Circle()
                                    .strokeBorder(
                                        viewModel?.selectedReason == reason
                                            ? Color.letsGoBlue
                                            : Color(.systemGray3),
                                        lineWidth: 2
                                    )
                                    .background(
                                        Circle()
                                            .fill(
                                                viewModel?.selectedReason == reason
                                                    ? Color.letsGoBlue
                                                    : Color.clear
                                            )
                                            .padding(4)
                                    )
                                    .frame(width: 22, height: 22)

                                Text(reason.displayText)
                                    .font(.body)
                                    .foregroundStyle(.primary)

                                Spacer()
                            }
                            .padding(14)
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }

                TextField(
                    "Tell us more (optional)...",
                    text: Binding(
                        get: { viewModel?.freeText ?? "" },
                        set: { viewModel?.freeText = $0 }
                    ),
                    axis: .vertical
                )
                .lineLimit(3...5)
                .textFieldStyle(.plain)
                .padding(14)
                .background(Color(.systemBackground))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color(.systemGray5), lineWidth: 1)
                )

                Button {
                    Task {
                        await viewModel?.submitReason()
                        if card.isFollowUpEligible && appState.sessionTracker.canShowLearningQuestion {
                            router.navigate(to: .followUpLearning(card))
                        } else {
                            router.popToRoot()
                        }
                    }
                } label: {
                    Text("Submit")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            viewModel?.canSubmit == true
                                ? Color.letsGoBlue
                                : Color(.systemGray4)
                        )
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(viewModel?.canSubmit != true || viewModel?.isSubmitting == true)
            }
            .padding(20)
        }
        .background(Color(.systemBackground))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = PassReasonViewModel(card: card, apiClient: appState.apiClient)
            }
        }
    }
}
