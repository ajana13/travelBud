import SwiftUI

struct FollowUpLearningView: View {
    @Environment(AppState.self) private var appState
    @Environment(AppRouter.self) private var router

    let card: RecommendationCard
    @State private var viewModel: FollowUpLearningViewModel?

    var body: some View {
        VStack(spacing: 24) {
            if viewModel?.isLoading == true {
                Spacer()
                ProgressView()
                Spacer()
            } else if let question = viewModel?.question {
                Spacer()

                // Header
                VStack(spacing: 8) {
                    Image(systemName: "lightbulb.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(Color.learningOrange)

                    Text("Quick Question")
                        .font(.title3)
                        .fontWeight(.bold)

                    Text("Help us learn your taste better with one quick answer.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                // Question card
                VStack(alignment: .leading, spacing: 14) {
                    Text(question.questionText)
                        .font(.headline)
                        .lineSpacing(2)

                    VStack(spacing: 8) {
                        ForEach(question.structuredAnswers) { answer in
                            Button {
                                viewModel?.selectedAnswerID = answer.id
                                Task {
                                    await viewModel?.submitAnswer()
                                    router.popToRoot()
                                }
                            } label: {
                                Text(answer.text)
                                    .font(.body)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(14)
                                    .background(
                                        viewModel?.selectedAnswerID == answer.id
                                            ? Color.letsGoBlue.opacity(0.08)
                                            : Color(.systemBackground)
                                    )
                                    .foregroundStyle(
                                        viewModel?.selectedAnswerID == answer.id
                                            ? Color.letsGoBlue
                                            : .primary
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(
                                                viewModel?.selectedAnswerID == answer.id
                                                    ? Color.letsGoBlue
                                                    : Color(.systemGray5),
                                                lineWidth: 1
                                            )
                                    )
                            }
                        }
                    }
                }
                .padding(22)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Spacer()

                Button {
                    viewModel?.skip()
                    router.popToRoot()
                } label: {
                    Text("Skip this question")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.bottom, 24)
            } else {
                // No question available or already completed
                Spacer()
                ContentUnavailableView(
                    "No questions right now",
                    systemImage: "checkmark.circle",
                    description: Text("We'll ask when we have something useful.")
                )
                Spacer()
            }
        }
        .padding(.horizontal, 20)
        .background(Color(.systemBackground))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = FollowUpLearningViewModel(
                    recommendationID: card.id,
                    apiClient: appState.apiClient,
                    sessionTracker: appState.sessionTracker
                )
            }
            await viewModel?.loadQuestion()
            if viewModel?.didComplete == true && viewModel?.question == nil {
                router.popToRoot()
            }
        }
    }
}
