from phonefarm.scheduler.velocity import velocity


def test_velocity_weights_saves():
    assert velocity(1000, 10, 5) > velocity(1000, 0, 0)
