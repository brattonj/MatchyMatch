// Regression test for a bug found by code review: the wheel's CSS rotation
// was computed as `spins*360 + segmentAngle` (segmentAngle = the *start*
// angle of the winning wedge), but rotating a conic-gradient wheel
// clockwise by R moves the wedge that was at angle theta to (theta+R), so
// the wedge that ends up under the fixed top pointer is the one whose
// angle is -R (mod 360) — not +R. That sign/reference-point error meant
// the wheel visually landed on the wrong wedge for 7 of its 8 segments,
// while the result text/score used the (correct) intended segment index.
import { render, fireEvent, cleanup } from '@testing-library/react';
import RochellesSpinnerBoard from '../components/rochellespinner/RochellesSpinnerBoard';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

const SEGMENT_COUNT = 8; // segments.length in RochellesSpinnerBoard

function wheelRotationDeg(container) {
  const wheel = container.querySelector('[style*="conic-gradient"]');
  const match = wheel.style.transform.match(/rotate\((-?[\d.]+)deg\)/);
  return parseFloat(match[1]);
}

// Given the applied rotation, compute which wedge visually ends up under
// the fixed top pointer (angle 0). Mirrors the geometry: rotating the wheel
// clockwise by R moves the wedge originally at angle theta to (theta + R),
// so the wedge now at the top satisfies theta = -R (mod 360).
function visibleSegmentFromRotation(rotationDeg) {
  const segmentSize = 360 / SEGMENT_COUNT;
  const angleAtTop = ((-rotationDeg % 360) + 360) % 360;
  return Math.floor(angleAtTop / segmentSize);
}

test.each([0, 1, 2, 3, 4, 5, 6, 7])(
  'segment %i lands visually under the pointer when it is the chosen segment',
  (targetSegment) => {
    // First Math.random() call picks `spins` (5 + rand*5); second picks
    // `randomSegment` (floor(rand * 8)). Pin both so the outcome is exact.
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // spins = 5
      .mockReturnValueOnce(targetSegment / SEGMENT_COUNT); // randomSegment = targetSegment

    const { container } = render(<RochellesSpinnerBoard />);
    const spinBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      /spin the wheel/i.test(b.textContent)
    );
    fireEvent.click(spinBtn);

    const rotation = wheelRotationDeg(container);
    expect(visibleSegmentFromRotation(rotation)).toBe(targetSegment);
  }
);
