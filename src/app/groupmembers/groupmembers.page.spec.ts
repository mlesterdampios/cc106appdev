import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GroupmembersPage } from './groupmembers.page';

describe('GroupmembersPage', () => {
  let component: GroupmembersPage;
  let fixture: ComponentFixture<GroupmembersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupmembersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupmembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
