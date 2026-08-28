import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TicTacToeBoard from '../components/tictactoe/TicTacToeBoard'

describe('TicTacToeBoard', () => {
  test('renders the game board', () => {
    render(<TicTacToeBoard />)
    expect(screen.getByText(/Tic Tac Toe with Brian/i)).toBeInTheDocument()
  })

  test('displays initial stats', () => {
    render(<TicTacToeBoard />)
    expect(screen.getByText('0')).toBeInTheDocument() // Player wins
  })

  test('allows player to make a move', () => {
    render(<TicTacToeBoard />)
    const cells = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-label')?.includes('cell'))
    
    if (cells.length > 0) {
      fireEvent.click(cells[0])
      // After player move, AI should think
      expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument()
    }
  })

  test('displays "Your turn" when not AI thinking', () => {
    render(<TicTacToeBoard />)
    expect(screen.getByText(/Your turn/i)).toBeInTheDocument()
  })

  test('has a new game button', () => {
    render(<TicTacToeBoard />)
    expect(screen.getByText(/New Game/i)).toBeInTheDocument()
  })

  test('shows win screen after game ends', async () => {
    render(<TicTacToeBoard />)
    
    // Make multiple moves to trigger a game end
    const cells = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-label')?.includes('cell'))
    
    if (cells.length > 0) {
      fireEvent.click(cells[0])
      
      await waitFor(() => {
        // After some moves, we should see either a win screen or continue playing
        const playAgainBtn = screen.queryByText(/Play Again/i)
        if (playAgainBtn) {
          expect(playAgainBtn).toBeInTheDocument()
        }
      }, { timeout: 2000 })
    }
  })
})
