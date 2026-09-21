from pathlib import Path


def test_rkp_fixture():
    fixture = Path(__file__).parent.parent / "fixtures" / "remote_provisioning_dump.txt"
    text = fixture.read_text()
    assert "rpcAuthorName" in text
