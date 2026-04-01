import SwiftUI

struct NotificationPreviewView: View {
    @State private var viewModel = NotificationPreviewViewModel()

    var body: some View {
        ZStack {
            // Dark lock screen background
            LinearGradient(
                colors: [
                    Color(red: 0.1, green: 0.1, blue: 0.18),
                    Color(red: 0.086, green: 0.13, blue: 0.24),
                    Color(red: 0.06, green: 0.2, blue: 0.375),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack {
                // Clock
                VStack(spacing: -4) {
                    Text("9:41")
                        .font(.system(size: 60, weight: .thin, design: .default))
                        .foregroundStyle(.white)

                    Text("Saturday, March 28")
                        .font(.body)
                        .foregroundStyle(.white.opacity(0.8))
                }
                .padding(.top, 40)

                Spacer()

                // Notification cards
                VStack(spacing: 10) {
                    ForEach(viewModel.previews) { preview in
                        notificationBanner(preview)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 60)
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder
    private func notificationBanner(_ preview: NotificationPreview) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 5)
                    .fill(preview.accentColor.opacity(0.8))
                    .frame(width: 20, height: 20)
                    .overlay {
                        Text("L")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                    }

                Text("LETSGO")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.white.opacity(0.8))

                Spacer()

                Text(preview.timeAgo)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.6))
            }

            Text(preview.title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(.white)

            Text(preview.body)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.85))
                .lineSpacing(2)

            if let ttl = preview.ttlMinutes {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)
                    Text("Expires in \(ttl) min")
                        .font(.caption2)
                        .fontWeight(.medium)
                }
                .foregroundStyle(.white.opacity(0.7))
                .padding(.top, 2)
            }
        }
        .padding(14)
        .background(
            preview.type == .learning
                ? Color.purple.opacity(0.2)
                : Color.white.opacity(0.15)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
