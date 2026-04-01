import SwiftUI

struct ActionButtonBar: View {
    let onAction: (ActionType) -> Void

    var body: some View {
        HStack(spacing: 8) {
            Button { onAction(.imIn) } label: {
                Text(ActionType.imIn.displayText)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.imInGreen)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            Button { onAction(.maybe) } label: {
                Text(ActionType.maybe.displayText)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(.systemGray5))
                    .foregroundStyle(.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            Button { onAction(.pass) } label: {
                Text(ActionType.pass.displayText)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(.clear)
                    .foregroundStyle(.secondary)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(.systemGray4), lineWidth: 1)
                    )
            }

            Button { onAction(.cant) } label: {
                Text(ActionType.cant.displayText)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(.clear)
                    .foregroundStyle(Color(.systemGray3))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color(.systemGray5), lineWidth: 1)
                    )
            }
        }
    }
}
